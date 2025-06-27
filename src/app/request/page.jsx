import GameRequestList from "./GameRequestList";
import GameRequestForm from "./gameRequest";

export default function RequestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <GameRequestForm />
      <div className="w-full max-w-2xl mt-8">
        <GameRequestList />
      </div>
    </div>
  );
}
