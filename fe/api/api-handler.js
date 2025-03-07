"server-only";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function handleApiRequest(
  method,
  endpoint,
  options = {},
  debug = false
) {
  const {
    body,
    token,
    revalidate,
    headerOptions,
    tags,
    cache, // 'force-cache'  'no-store'
  } = options;

  try {
    let headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (headerOptions) {
      headers = { ...headers, ...headerOptions };
    }

    const fetchOptions = {
      method,
      headers,
      ...(body && {
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    };

    if (cache) {
      fetchOptions.cache = cache;
    }
    if (revalidate !== undefined) {
      fetchOptions.next = {
        ...fetchOptions.next,
        revalidate,
      };
    }
    if (tags) {
      fetchOptions.next = {
        ...fetchOptions.next,
        tags,
      };
    }

    const apiUrl = `${BASE_URL}${endpoint}`;
    const response = await fetch(apiUrl, fetchOptions);

    if (!response.ok) {
      // Log the full response when there is an error
      const errorText = await response.text();
      console.error(`API Error (${method} ${endpoint}):`, errorText);
      throw new Error(`API Request Failed: ${response.status} - ${response.statusText}`);
    }

    // Detect response type based on content-type header
    const contentType = response.headers.get("Content-Type");

    let data;
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (
      contentType?.includes("application/pdf") ||
      contentType?.includes("image/")
    ) {
      const fileData = await response.blob();
      data = { data: fileData, response };
    } else if (contentType?.includes("text/csv")) {
      const csvData = await response.blob();
      data = { data: csvData, response };
    } else if (contentType?.includes("text/")) {
      const text = await response.text();
      data = { data: text, response };
    } else {
      try {
        const blob = await response.clone().blob();
        data = { data: blob, response };
      } catch {
        const text = await response.text();
        data = { data: text, response };
      }
    }

    if (debug) console.log(" API Response Data:", data);

    return data;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error.message);
    throw error;
  }
}
