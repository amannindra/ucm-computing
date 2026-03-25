import axios from "axios";
import type { BucketSummary } from "./types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const getRequestErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return String(error.response.data.message);
    }
    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the backend server at " + BASE_URL + ".";
    }
  }
  return fallbackMessage;
};

export type BucketListResponse = {
  success: boolean;
  message: string;
  buckets: BucketSummary[];
};

export type BucketMutationResponse = {
  success: boolean;
  message: string;
  bucket_name?: string;
  previous_bucket_name?: string;
  user_uuid?: string;
};

export const getUserBuckets = async (email: string): Promise<BucketListResponse> => {
  console.log("getUserBuckets is called, email: ", email);
  try {
    const response = await axios.get(`${BASE_URL}/get-user-buckets`, {
      params: { email },
    });
    const buckets = Array.isArray(response.data?.buckets)
      ? response.data.buckets.map((bucket: { name?: string; created_at?: string }) => ({
          name: bucket.name ?? "",
          createdAt: bucket.created_at ?? "",
        }))
      : [];
    return {
      success: Boolean(response.data?.success),
      message: String(response.data?.message ?? "Buckets fetched successfully."),
      buckets,
    };
  } catch (error) {
    console.error("Error fetching user buckets", error);
    return {
      success: false,
      message: getRequestErrorMessage(error, "Failed to fetch buckets."),
      buckets: [],
    };
  }
};

export const createBucket = async (
  email: string,
): Promise<BucketMutationResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/create-bucket`, { email });
    return response.data as BucketMutationResponse;
  } catch (error) {
    console.error("Error creating bucket", error);
    return {
      success: false,
      message: getRequestErrorMessage(error, "Failed to create bucket."),
    };
  }
};

export const renameBucket = async (
  email: string,
  currentBucketName: string,
  newBucketName: string,
): Promise<BucketMutationResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/rename-bucket`, {
      email,
      current_bucket_name: currentBucketName,
      new_bucket_name: newBucketName,
    });
    return response.data as BucketMutationResponse;
  } catch (error) {
    console.error("Error renaming bucket", error);
    return {
      success: false,
      message: getRequestErrorMessage(error, "Failed to rename bucket."),
    };
  }
};


export const deleteBucket = async (
  email: string,
  currentBucketName: string,
): Promise<BucketMutationResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/delete-bucket`, {
      email,
      current_bucket_name: currentBucketName,
    });
    return response.data as BucketMutationResponse;
  }
  catch (error) {
    console.error("Error deleting bucket", error);
    return {
      success: false,
      message: getRequestErrorMessage(error, "Failed to delete bucket."),
    };
  }
};
