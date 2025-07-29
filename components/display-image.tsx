import React from 'react';
import { CgClose } from 'react-icons/cg';

interface DisplayImageProps {
    imgUrl: string;
    onClose: () => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ imgUrl, onClose }) => {
    return (
        <div className='fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50'>
            <div className='relative max-w-4xl w-full max-h-[90vh] bg-white rounded shadow-lg'>
                <div className='absolute top-2 right-2 text-3xl text-red-600 cursor-pointer' onClick={onClose}>
                    <CgClose />
                </div>
                <div className='flex justify-center items-center h-full p-4'>
                    <img
                        src={imgUrl}
                        alt="Preview"
                        className='max-w-full max-h-[80vh] object-contain rounded'
                    />
                </div>
            </div>
        </div>
    );
};

export default DisplayImage;
