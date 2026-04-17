import { useState } from "react";
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { CallEnded } from "./call-ended";
import { CallActive } from "./call-active";
import { CallLobby } from "./call-lobby";

interface Props {
  meetingName: string;
  hasOpenAiKey: boolean;
}

export const CallUI = ({ meetingName, hasOpenAiKey }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

  const handleJoin = async () => {
    if (!call) return;

    try {
      await call.join();
    } catch {
      toast.error("Unable to join call. Please verify your API key settings.");
      return;
    }

    setShow("call");
  };

  const handleLeave = () => {
    if (!call) return;

    call.endCall();
    setShow("ended");
  };

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && (
        <CallLobby onJoin={handleJoin} hasOpenAiKey={hasOpenAiKey} />
      )}
      {show === "call" && (
        <CallActive onLeave={handleLeave} meetingName={meetingName} />
      )}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};
