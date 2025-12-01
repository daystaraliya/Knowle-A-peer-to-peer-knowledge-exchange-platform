
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-textSecondary">
        <p>&copy; {new Date().getFullYear()} Knowle. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-primary">About</a>
          <a href="#" className="hover:text-primary">Contact</a>
          <a href="#" className="hover:text-primary">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
