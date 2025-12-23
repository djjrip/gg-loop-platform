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
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">Play. Earn. Loop.</span>
              <br />
              A gaming rewards platform built for the players who never felt seen.
            </p>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Healing the inner gamer - one match at a time.
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
                  href="https://tiktok.me/jaysonbq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 hover-elevate px-2 py-1 rounded-md"
                  data-testid="link-tiktok-founder"
                >
                  <SiTiktok className="h-4 w-4" />
                  Founder on TikTok
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
            <h3 className="font-semibold mb-3">Company Identity</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="font-medium text-foreground">GG LOOP LLC</li>
              <li>Domain: ggloop.io</li>
              <li>Founder: Jayson BQ</li>
              <li>
                <a href="mailto:info@ggloop.io" className="hover:text-ggloop-orange" data-testid="link-contact">
                  info@ggloop.io
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            GG Loop isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games
            or anyone officially involved in producing or managing Riot Games properties. Riot Games, and
            all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            &copy; 2025 GG LOOP LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
