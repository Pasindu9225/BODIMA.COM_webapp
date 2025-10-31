import { cn } from "@/lib/utils";
import Link from "next/link";

export function BordimaLogo({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      href="/"
      className={cn(
        "font-headline text-2xl font-bold text-primary",
        className
      )}
      {...props}
    >
      Bordima.lk
    </Link>
  );
}
