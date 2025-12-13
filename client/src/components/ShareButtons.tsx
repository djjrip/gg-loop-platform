import { Button } from "@/components/ui/button";
import { Share2, Copy, CheckCircle2 } from "lucide-react";
import { SiX, SiTiktok } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonsProps {
  title: string;
  description: string;
  url?: string;
  hashtags?: string[];
  variant?: "default" | "icon";
  className?: string;
}

export function ShareButtons({ 
  title, 
  description, 
  url, 
  hashtags = ["GGLoop", "Gaming"], 
  variant = "default",
  className = ""
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = url || window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Paste it anywhere to share",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const hashtagStr = hashtags.map(tag => `#${tag.replace('#', '')}`).join(' ');
    const text = `${description} ${hashtagStr}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleShareTikTok = () => {
    // TikTok doesn't have a direct share URL API like Twitter
    // Copy the message and open TikTok for manual posting
    const message = `${description}\n\n${shareUrl}\n\n${hashtags.map(t => `#${t.replace('#', '')}`).join(' ')}`;
    navigator.clipboard.writeText(message);
    toast({
      title: "Caption copied!",
      description: "Open TikTok app and paste this caption",
    });
  };

  if (variant === "icon") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className={className}
            data-testid="button-share-dropdown"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleShareTwitter} data-testid="share-twitter">
            <SiX className="mr-2 h-4 w-4" />
            Share on X/Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareTikTok} data-testid="share-tiktok">
            <SiTiktok className="mr-2 h-4 w-4" />
            Share on TikTok
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink} data-testid="share-copy">
            {copied ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleShareTwitter}
        data-testid="button-share-twitter"
      >
        <SiX className="h-4 w-4 mr-2" />
        X/Twitter
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleShareTikTok}
        data-testid="button-share-tiktok"
      >
        <SiTiktok className="h-4 w-4 mr-2" />
        TikTok
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCopyLink}
        data-testid="button-share-copy"
      >
        {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
    </div>
  );
}
