import React from "react";
import Clock from "../components/Clock";
import Weather from "../components/Weather";
import Calendar from "../components/Calendar";
import SchoolLunch from "../components/SchoolLunch";

function HomePage({ key }) {
    return (
        <div
            key={key}
            className="relative z-10 min-h-screen w-full flex flex-col text-white"
        >
            <div className="min-h-12 w-full flex items-center justify-between gap-4 px-4 text-white">
                <Clock />
                <Weather />
            </div>
            <div className="min-w-full flex flex-row items-start justify-around pt-2 px-8 gap-2 ">
                <div className="min-w-3/4 max-w-3/4">
                    <Calendar />
                </div>
                <div className="flex-1">
                    <SchoolLunch />
                </div>
            </div>
        </div>
    );
}

export default HomePage;
