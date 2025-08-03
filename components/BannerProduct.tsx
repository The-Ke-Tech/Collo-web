"use client";

import React, { useEffect, useState } from 'react';
import image1 from '../assets/banner/img1.webp';
import image2 from '../assets/banner/img2.webp';
import image3 from '../assets/banner/img3.jpg';
import image4 from '../assets/banner/img4.jpg';
import image5 from '../assets/banner/img5.webp';

import image1Mobile from '../assets/banner/img1_mobile.jpg';
import image2Mobile from '../assets/banner/img2_mobile.webp';
import image3Mobile from '../assets/banner/img3_mobile.jpg';
import image4Mobile from '../assets/banner/img4_mobile.jpg';
import image5Mobile from '../assets/banner/img5_mobile.png';

import { FaAngleRight, FaAngleLeft } from "react-icons/fa";

const BannerProduct = () => {
    const [currentImage, setCurrentImage] = useState(0);

    const desktopImages = [image1, image2, image3, image4, image5];
    const mobileImages = [image1Mobile, image2Mobile, image3Mobile, image4Mobile, image5Mobile];

    const nextImage = () => {
        if (desktopImages.length - 1 > currentImage) {
            setCurrentImage((prev) => prev + 1);
        }
    };

    const preveImage = () => {
        if (currentImage !== 0) {
            setCurrentImage((prev) => prev - 1);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (desktopImages.length - 1 > currentImage) {
                nextImage();
            } else {
                setCurrentImage(0);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentImage]);

    return (
        <div className="container mx-auto px-4 rounded-lg overflow-hidden">
            <div className="h-56 md:h-72 w-full relative bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF]">
                {/* Controls */}
                <div className="absolute z-10 h-full w-full md:flex items-center hidden">
                    <div className="flex justify-between w-full text-2xl px-4">
                        <button
                            onClick={preveImage}
                            className="bg-white hover:bg-gray-100 text-gray-800 shadow-md rounded-full p-2 transition-transform transform hover:scale-110 border border-gray-200"
                        >
                            <FaAngleLeft />
                        </button>
                        <button
                            onClick={nextImage}
                            className="bg-white hover:bg-gray-100 text-gray-800 shadow-md rounded-full p-2 transition-transform transform hover:scale-110 border border-gray-200"
                        >
                            <FaAngleRight />
                        </button>
                    </div>
                </div>

                {/* Desktop & Tablet */}
                <div className="hidden md:flex h-full w-full overflow-hidden">
                    {desktopImages.map((imageURl, index) => (
                        <div
                            className="w-full h-full min-w-full min-h-full transition-all duration-500 ease-in-out"
                            key={index}
                            style={{ transform: `translateX(-${currentImage * 100}%)` }}
                        >
                            <img
                                src={typeof imageURl === 'string' ? imageURl : imageURl.src}
                                className="w-full h-full object-cover"
                                alt={`banner-${index}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile */}
                <div className="flex h-full w-full overflow-hidden md:hidden">
                    {mobileImages.map((imageURl, index) => (
                        <div
                            className="w-full h-full min-w-full min-h-full transition-all duration-500 ease-in-out"
                            key={index}
                            style={{ transform: `translateX(-${currentImage * 100}%)` }}
                        >
                            <img
                                src={typeof imageURl === 'string' ? imageURl : imageURl.src}
                                className="w-full h-full object-cover"
                                alt={`mobile-banner-${index}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BannerProduct;
