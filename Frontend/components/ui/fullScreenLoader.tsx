// components/ui/FullScreenLoader.tsx
import { TailSpin } from "react-loader-spinner";

export default function FullScreenLoader({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#000" // Set spinner color to black
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}} // Add custom styles here if needed
          wrapperClass="" // Add custom classes here if needed
        />
        <p className="text-black mt-4 text-lg">{message}</p>
      </div>
    </div>
  );
}
