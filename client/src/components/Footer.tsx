export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur mt-16">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-semibold mb-3">GG Loop</h3>
            <p className="text-sm text-muted-foreground">
              Track your League of Legends and Valorant performance. Earn rewards for your gameplay.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@ggloop.io" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="https://discord.gg/ggloop" className="text-muted-foreground hover:text-foreground">
                  Discord Community
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
