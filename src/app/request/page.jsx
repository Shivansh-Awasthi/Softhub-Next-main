import GameRequestList from "./GameRequestList";
import GameRequestForm from "./gameRequest";

export default function RequestPage() {
    return (
        <div className="bg-[#030712]">
            <GameRequestForm />
            <GameRequestList />
        </div>
    );
}