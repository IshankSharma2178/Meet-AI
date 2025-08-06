import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials } from "@dicebear/collection";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant: "botttsNeutral" | "initials";
}

export const GeneratedAvatar = ({
  seed,
  className,
  variant,
}: GeneratedAvatarProps) => {
  const avatar =
    variant === "botttsNeutral"
      ? createAvatar(botttsNeutral, { seed })
      : createAvatar(initials, {
          seed,
          fontWeight: 500,
          fontSize: 42,
        });

  return (
    <div className={cn("w-12 h-12", className)}>
      <Avatar className="w-full h-full rounded-full overflow-hidden border">
        <AvatarImage
          src={avatar.toDataUri()}
          alt="Avatar"
          className="object-cover w-full h-full"
        />
        <AvatarFallback className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground text-sm">
          {seed.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
