import ssl
import urllib.request

ssl._create_default_https_context = ssl._create_unverified_context

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from torchvision.models import resnet18
import sys
from tqdm import tqdm
import time
import argparse


SMOKE_TEST_MAX_SECONDS = 5.0
SMOKE_TEST_TRAIN_SAMPLES = 128
SMOKE_TEST_TEST_SAMPLES = 64


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def build_model(device: torch.device) -> nn.Module:
    model = resnet18(weights=None)
    model.conv1 = nn.Conv2d(
        in_channels=1,
        out_channels=64,
        kernel_size=7,
        stride=2,
        padding=3,
        bias=False,
    )
    model.fc = nn.Linear(model.fc.in_features, 10)
    return model.to(device)


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
    epoch: int,
    deadline: float,
) -> None:
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    pbar = tqdm(loader, desc="Training", total=len(loader))
    for images, labels in pbar:
        if time.monotonic() >= deadline:
            print("Stopping training early after reaching the smoke-test time limit.")
            break
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    if total == 0:
        pbar.close()
        return

    epoch_loss = running_loss / total
    epoch_acc = 100.0 * correct / total
    print(f"Epoch {epoch}: train loss={epoch_loss:.4f}, train acc={epoch_acc:.2f}%")
    pbar.set_postfix(loss=epoch_loss, acc=epoch_acc)
    pbar.close()


@torch.no_grad()
def evaluate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    deadline: float,
) -> None:
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    pbar = tqdm(loader, desc="Testing", total=len(loader))
    for images, labels in pbar:
        if time.monotonic() >= deadline:
            print("Stopping evaluation early after reaching the smoke-test time limit.")
            break
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    if total == 0:
        pbar.close()
        return

    test_loss = running_loss / total
    test_acc = 100.0 * correct / total
    pbar.set_postfix(loss=test_loss, acc=test_acc)
    pbar.close()
    print(f"Test loss={test_loss:.4f}, test acc={test_acc:.2f}%")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--use_cuda", type=lambda x: x.lower() == "true", default=True)
    parser.add_argument("--model_name", type=str, default="model.pth")
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--learning_rate", type=float, default=1e-3)
    parser.add_argument("--batch_size", type=int, default=128)
    parser.add_argument("--num_workers", type=int, default=2)
    parser.add_argument(
        "--pin_memory", type=lambda x: x.lower() == "true", default=True
    )
    args = parser.parse_args()

    print(f"Use CUDA: {args.use_cuda}")
    print(f"Model Name: {args.model_name}")
    print(f"Epochs: {args.epochs}")
    print(f"Learning Rate: {args.learning_rate}")
    print(f"Batch Size: {args.batch_size}")
    print(f"Num Workers: {args.num_workers}")
    print(f"Pin Memory: {args.pin_memory}")

    device = get_device() if args.use_cuda else torch.device("cpu")
    if device.type == "cpu":
        print("Running on CPU")
    else:
        print(f"Using device: {device}")

    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        torch.backends.cudnn.benchmark = True

    transform = transforms.Compose(
        [
            transforms.ToTensor(),
            transforms.Normalize((0.1307,), (0.3081,)),
        ]
    )

    train_dataset = datasets.MNIST(
        root="./data",
        train=True,
        download=True,
        transform=transform,
    )
    test_dataset = datasets.MNIST(
        root="./data",
        train=False,
        download=True,
        transform=transform,
    )

    train_dataset = Subset(
        train_dataset,
        range(min(SMOKE_TEST_TRAIN_SAMPLES, len(train_dataset))),
    )
    test_dataset = Subset(
        test_dataset,
        range(min(SMOKE_TEST_TEST_SAMPLES, len(test_dataset))),
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=args.pin_memory and device.type == "cuda",
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=args.batch_size * 2,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=args.pin_memory and device.type == "cuda",
    )

    model = build_model(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.learning_rate)
    deadline = time.monotonic() + SMOKE_TEST_MAX_SECONDS

    for epoch in range(1, args.epochs + 1):
        if time.monotonic() >= deadline:
            print("Skipping remaining epochs after reaching the smoke-test time limit.")
            break
        train_one_epoch(
            model, train_loader, criterion, optimizer, device, epoch, deadline
        )

    if time.monotonic() < deadline:
        evaluate(model, test_loader, criterion, device, deadline)
    else:
        print("Skipping evaluation after reaching the smoke-test time limit.")

    torch.save(model.state_dict(), args.model_name)


if __name__ == "__main__":
    main()
