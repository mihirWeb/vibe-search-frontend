# Vibe Search Application

## Overview
The Vibe Search application is a Next.js frontend designed to provide users with a seamless search experience. It allows users to enter queries, filter results, and view detailed information about each result.

## Project Structure
The project is organized into the following main directories and files:

- **src/**: Contains the source code for the application.
  - **app/**: Main application files including layout and pages.
    - **layout.tsx**: Defines the main layout of the application.
    - **page.tsx**: Entry point of the application.
    - **globals.css**: Global styles including Tailwind CSS.
    - **api/**: Contains API routes for handling requests.
      - **search/**: API route for search functionality.
  - **components/**: Reusable components for the application.
    - **SearchBar.tsx**: Search input field component.
    - **SearchResults.tsx**: Displays search results.
    - **ResultCard.tsx**: Represents individual search results.
    - **FilterPanel.tsx**: Allows filtering of search results.
    - **LoadingSpinner.tsx**: Loading indicator component.
  - **hooks/**: Custom hooks for managing state and logic.
    - **useSearch.ts**: Manages search logic.
    - **useDebounce.ts**: Provides debounce functionality.
  - **services/**: API service functions.
    - **api.ts**: Functions for making API calls.
  - **types/**: TypeScript types and interfaces.
    - **index.ts**: Type definitions used throughout the application.
  - **utils/**: Utility functions.
    - **helpers.ts**: Reusable helper functions.

- **public/**: Contains static assets.
  - **favicon.ico**: Application favicon.

- **.env.local**: Environment variables for local development.

- **.env.example**: Example environment variables.

- **.gitignore**: Specifies files to ignore in Git.

- **next.config.js**: Configuration settings for Next.js.

- **tsconfig.json**: TypeScript configuration file.

- **tailwind.config.js**: Tailwind CSS configuration.

- **postcss.config.js**: PostCSS configuration.

- **package.json**: Lists dependencies and scripts for the project.

## Setup Instructions
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the dependencies using:
   ```
   npm install
   ```
4. Create a `.env.local` file based on the `.env.example` file and fill in the required environment variables.
5. Start the development server:
   ```
   npm run dev
   ```
6. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage
- Enter a search query in the search bar to find results.
- Use the filter panel to refine your search.
- View detailed information about each result by clicking on the respective card.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.