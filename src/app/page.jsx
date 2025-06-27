import { Suspense } from 'react';
import HomeClient from './HomeClient';
import HomeSkeleton from './components/HomeSkeleton';

// Set revalidation time to 1 hour (3600 seconds)
export const revalidate = 3600;

export const metadata = {
  title: 'ToxicGames - Download Free Games and Software',
  description: 'Download free games and software for Mac, PC, Android, PS2, PS3, PS4, and more.',
};

// Function to fetch Mac games
async function fetchMacGames() {
  try {
    const initialResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/mac?page=1&limit=48`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        },
        next: { revalidate: 3600 }
      }
    );

    const initialData = await initialResponse.json();

    // Dynamic page logic
    const limitPage = 48;
    const totalPage = initialData.total;
    const latestPage = Math.ceil(totalPage / limitPage);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/mac?page=${latestPage}&limit=48`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        },
        next: { revalidate: 3600 }
      }
    );

    const responseData = await response.json();
    return {
      apps: responseData.apps || [],
      total: responseData.total || 0
    };
  } catch (error) {
    console.log("Error fetching mac games " + error);
    return { apps: [], total: 0 };
  }
}

// Function to fetch Mac softwares
async function fetchMacSoftwares() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/smac`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        },
        next: { revalidate: 3600 }
      }
    );

    const responseData = await response.json();
    return {
      apps: responseData.apps || [],
      total: responseData.total || 0
    };
  } catch (error) {
    console.log("Error fetching mac softwares " + error);
    return { apps: [], total: 0 };
  }
}

// Function to fetch PC games (latest games - page 1)
async function fetchPcGames() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/pc?page=1&limit=48`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        },
        next: { revalidate: 3600 }
      }
    );

    const responseData = await response.json();
    return {
      apps: responseData.apps || [],
      total: responseData.total || 0
    };
  } catch (error) {
    console.log("Error fetching PC games " + error);
    return { apps: [], total: 0 };
  }
}

// Function to fetch Android games
async function fetchAndroidGames() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/android`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        },
        next: { revalidate: 3600 }
      }
    );

    const responseData = await response.json();
    return {
      apps: responseData.apps || [],
      total: responseData.total || 0
    };
  } catch (error) {
    console.log("Error fetching Android games " + error);
    return { apps: [], total: 0 };
  }
}

// Function to fetch PS2 games
async function fetchPS2Games() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/ps2`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        },
        next: { revalidate: 3600 }
      }
    );

    const responseData = await response.json();
    return {
      apps: responseData.apps || [],
      total: responseData.total || 0
    };
  } catch (error) {
    console.log("Error fetching PS2 ISO's " + error);
    return { apps: [], total: 0 };
  }
}

// This component fetches data and renders the HomeClient
async function HomeDataLoader() {
  // Fetch all data in parallel
  const [macGamesData, macSoftwaresData, pcGamesData, androidGamesData, ps2GamesData] = await Promise.all([
    fetchMacGames(),
    fetchMacSoftwares(),
    fetchPcGames(),
    fetchAndroidGames(),
    fetchPS2Games()
  ]);

  return (
    <HomeClient
      macGames={macGamesData.apps}
      macSoftwares={macSoftwaresData.apps}
      pcGames={pcGamesData.apps}
      androidGames={androidGamesData.apps}
      ps2Games={ps2GamesData.apps}
      totalMacGames={macGamesData.total}
      totalMacSoft={macSoftwaresData.total}
      totalPcGames={pcGamesData.total}
      totalAndroidGames={androidGamesData.total}
      totalPs2Iso={ps2GamesData.total}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeDataLoader />
    </Suspense>
  );
}
