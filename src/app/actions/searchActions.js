


// Client-side utility to search for apps
export async function searchApps(query, page = 1, limit = 7) {
  try {
    if (!query || query.trim() === '') {
      return { success: true, apps: [], total: 0 };
    }

    // Fetch data from the API on the client side
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/all?page=${page}&limit=${limit}&q=${encodeURIComponent(query.trim())}`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.success
      ? { success: true, apps: data.apps, total: data.total }
      : { success: false, apps: [], total: 0, error: 'Failed to fetch search results' };
  } catch (error) {
    console.error("Error in searchApps client utility:", error);
    return {
      success: false,
      apps: [],
      total: 0,
      error: error.message || 'An error occurred while searching'
    };
  }
}
