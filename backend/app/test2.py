import asyncio

async def main():
    print('Hello ...')
    await asyncio.sleep(1) # Asynchronous sleep
    print('... World!')

# Run the main entry point
asyncio.run(main())