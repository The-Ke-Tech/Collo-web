'use client';

import React from 'react';
import { CgClose } from 'react-icons/cg';

interface DisplayImageProps {
    imgUrl: string;
    onClose: () => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ imgUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="relative max-w-5xl w-full max-h-[90vh] rounded-xl shadow-2xl overflow-hidden transform scale-95 transition-all animate-slideUp 
                bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300">
                
                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-3xl text-white bg-red-600 rounded-full p-1 hover:bg-red-700 transition shadow-lg"
                    onClick={onClose}
                >
                    <CgClose />
                </button>

                {/* Image Display */}
                <div className="flex justify-center items-center h-full p-4">
                    <img
                        src={imgUrl}
                        alt="Preview"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default DisplayImage;
