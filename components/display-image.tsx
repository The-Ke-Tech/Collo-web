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
                bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-gray-100">
                
                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-3xl text-white bg-gradient-to-r from-red-500 to-red-700 rounded-full p-1 hover:opacity-90 transition shadow-lg"
                    onClick={onClose}
                >
                    <CgClose />
                </button>

                {/* Image Display */}
                <div className="flex justify-center items-center h-full p-4">
                    <img
                        src={imgUrl}
                        alt="Preview"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg border-2 border-white/20"
                    />
                </div>
            </div>
        </div>
    );
};

export default DisplayImage;
