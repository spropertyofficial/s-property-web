import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

export default function CategoryItem({ 
  icon: Icon, 
  label, 
  href, 
  ariaLabel 
}) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-tosca-100"
      aria-label={ariaLabel || label}
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full 
                      bg-tosca-200
                      border border-tosca-100/20
                      group-hover:bg-tosca-100 group-hover:shadow-lg
                      group-hover:-translate-y-1
                      drop-shadow-xl
                      transition-all duration-200">
        <Icon 
          size={24} 
          className="text-white group-hover:text-white transition-colors" 
        />
      </div>
      <span className="text-sm text-gray-400 text-center w-[80px] break-words mt-2
                       group-hover:text-tosca-200 transition-colors">
        {label}
      </span>
    </Link>
  );
}

CategoryItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string
};