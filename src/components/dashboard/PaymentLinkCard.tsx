"use client";

import { CopyButton } from "../ui/CopyButton";
import { PrivacyModeBadge } from "../ui/PrivacyModeBadge";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ExternalLink, MoreVertical, Copy, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

import { PaymentLink } from "@/lib/apiClient";

interface PaymentLinkCardProps {
  link: PaymentLink;
  onDeactivate: (id: string) => void;
}

export function PaymentLinkCard({ link, onDeactivate }: PaymentLinkCardProps) {
  const { addToast } = useToast();
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${link.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard", "success");
  };

  return (
    <Card className="group hover:border-primary/30 transition-all duration-300">
      <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {link.amount} {link.token}
            </span>
            <Badge variant={link.status === "active" ? "default" : "secondary"}>
              {link.status}
            </Badge>
          </div>
          {link.description && (
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {link.description}
            </p>
          )}
        </div>
        <PrivacyModeBadge mode={link.privacyMode} />
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border group-hover:bg-muted transition-colors">
          <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">
            {url}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/links/${link.id}`}>
            <Eye className="w-3 h-3 mr-2" />
            View
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDeactivate(link.id)}
          disabled={link.status !== "active"}
        >
          <Trash2 className="w-3 h-3 mr-2" />
          Deactivate
        </Button>
      </CardFooter>
    </Card>
  );
}
