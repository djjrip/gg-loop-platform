import { SiDiscord, SiTiktok } from "react-icons/si";
import { Link } from "wouter";
import logoImage from "@assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur mt-16">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoImage} alt="GG LOOP Logo" className="h-8 w-auto" />
              <h3 className="font-semibold">GG Loop</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Play. Unlock. LOOP. A membership rewards program for dedicated gamers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://discord.gg/X6GXg2At2D" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 hover-elevate px-2 py-1 rounded-md"
                  data-testid="link-discord"
                >
                  <SiDiscord className="h-4 w-4" />
                  Join Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://tiktok.com/@gg.loop" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 hover-elevate px-2 py-1 rounded-md"
                  data-testid="link-tiktok"
                >
                  <SiTiktok className="h-4 w-4" />
                  Follow on TikTok
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:jaysonquindao1@gmail.com" className="text-muted-foreground hover:text-foreground" data-testid="link-contact">
                  jaysonquindao1@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            GG Loop isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games 
            or anyone officially involved in producing or managing Riot Games properties. Riot Games, and 
            all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            © 2025 GG Loop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
