import React from 'react';
import './globals.css';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <title>Vibe Search</title>
      </head>
      <body>
        <header>
          {/* <h1>Vibe Search</h1> */}
        </header>
        <main>{children}</main>
        {/* <footer>
          <p>&copy; {new Date().getFullYear()} Vibe Search. All rights reserved.</p>
        </footer> */}
      </body>
    </html>
  );
};

export default RootLayout;