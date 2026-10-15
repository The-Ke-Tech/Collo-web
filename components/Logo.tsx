// logo.tsx
import Image from "next/image";

export const Logo = ({ height = 40, width = 40 }: { height?: number; width?: number }) => {
  return (
    <Image
      height={height}
      width={width}
      alt="logo"
      src="/logo.png"
      className="bg-green-100 rounded-full p-1"
      loading="eager" // 🚀 Forces the browser to load the header logo instantly, fixing the LCP error completely
    />
  );
};
