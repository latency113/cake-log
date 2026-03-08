import { Link } from '@tanstack/react-router';
import React from 'react';

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <footer className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 shadow-inner ${className}`}>
      <div className="container mx-auto text-center">
        <Link to="/credits" className=" hover:text-gray-200 mb-2 hover:underline inline-block">
        <p className="text-sm">&copy; {new Date().getFullYear()} NVC Cake Program. All rights reserved. by Khan Samnuan IT Department</p>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
