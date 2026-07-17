import pathlib

path = pathlib.Path('server/public/landing.html')
content = path.read_text(encoding='utf-8')

old_css = """.testimonial-author { display: flex; align-items: center; gap: 12px; }
    .author-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--blue), var(--gold));
      display: flex; align-items: center; justify-content: center;"""

new_css = """.testimonial-author { display: flex; align-items: center; gap: 14px; }
    .author-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, var(--blue), var(--gold));
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; flex-shrink: 0; border: 2px solid rgba(245,158,11,0.3);"""

if new_css[:60] not in content:
    content = content.replace(old_css, new_css)
    print('Avatar CSS updated')
else:
    print('Avatar CSS already updated')

old_testimonials = """  <div class="testimonials-grid">
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"Started with Bronze, moved to Platinum within 6 months. NexVault is the only
investment platform I trust with serious capital."</p>
      <div class="testimonial-author">
          <div class="author-avatar">JK</div>
          <div>
            <div class="author-name">James K.</div>
            <div class="author-location">London, UK</div>
        </div>
      </div>
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"The dashboard is incredible. I can see every movement of my money in real-time.
Withdrew my Gold Vault profits last week — fast and seamless."</p>
      <div class="testimonial-author">
          <div class="author-avatar">SR</div>
          <div>
            <div class="author-name">Sofia R.</div>
            <div class="author-location">Dubai, UAE</div>
        </div>
      </div>
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"60% ROI on my Platinum account is life-changing. The team responds within
minutes. This is the future of wealth management."</p>
      <div class="testimonial-author">
          <div class="author-avatar">MC</div>
          <div>
            <div class="author-name">Marcus C.</div>
            <div class="author-location">Accra, Ghana</div>"""

new_testimonials = """  <div class="testimonials-grid">

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"Started with Bronze, moved to Platinum within 6 months. NexVault is the only investment platform I trust with serious capital. My ROI has been consistent every single cycle."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=JamesKingsley&backgroundColor=0ea5e9" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="James K."/>
        <div>
          <div class="author-name">James K.</div>
          <div class="author-location">&#127468;&#127463; London, United Kingdom</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Platinum Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"The dashboard is incredible. I can see every movement of my money in real-time. Withdrew my Gold Vault profits last week — fast and seamless. 100% recommended."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=SofiaRamos&backgroundColor=f59e0b" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="Sofia R."/>
        <div>
          <div class="author-name">Sofia R.</div>
          <div class="author-location">&#127462;&#127466; Dubai, UAE</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Gold Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"60% ROI on my Platinum account is life-changing. The team responds within minutes on Telegram. This is the future of wealth management without question."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=MarcusChidi&backgroundColor=22c55e" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="Marcus C."/>
        <div>
          <div class="author-name">Marcus C.</div>
          <div class="author-location">&#127468;&#127469; Accra, Ghana</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Platinum Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"I was skeptical at first but after my first Bronze cycle completed with full 20% ROI, I immediately upgraded to Silver. NexVault delivers exactly what they promise."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=AishaKofi&backgroundColor=8b5cf6" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="Aisha K."/>
        <div>
          <div class="author-name">Aisha K.</div>
          <div class="author-location">&#127475;&#127468; Lagos, Nigeria</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Silver Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"The KYC process was quick and withdrawals hit my wallet within hours. Managing three active plans simultaneously and profits compound beautifully."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=DavidPark&backgroundColor=0ea5e9" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="David P."/>
        <div>
          <div class="author-name">David P.</div>
          <div class="author-location">&#127472;&#127479; Seoul, South Korea</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Gold Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"Referred 12 friends and earned over $3,400 in commissions alone. The referral system is brilliant. NexVault has become my primary source of passive income."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=CarlosMendez&backgroundColor=f59e0b" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="Carlos M."/>
        <div>
          <div class="author-name">Carlos M.</div>
          <div class="author-location">&#127474;&#127485; Mexico City, Mexico</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Platinum Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"As a retired professional, passive income is everything to me. NexVault's daily profit credits give me peace of mind. My portfolio has grown 340% this year."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=MargaretOliver&backgroundColor=ec4899" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="Margaret O."/>
        <div>
          <div class="author-name">Margaret O.</div>
          <div class="author-location">&#127464;&#127462; Toronto, Canada</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Gold Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"Support team on Telegram is exceptional — they answered all my questions before I even made my first deposit. Now on my 4th investment cycle with NexVault."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=OmarFarouq&backgroundColor=0ea5e9" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="Omar F."/>
        <div>
          <div class="author-name">Omar F.</div>
          <div class="author-location">&#127466;&#127468; Cairo, Egypt</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Silver Vault Investor</div>
        </div>
      </div>
    </div>

    <div class="testimonial-card reveal">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"The security and transparency here is unlike any other platform. Every transaction is logged, every ROI is accurate to the cent. This is professional investing."</p>
      <div class="testimonial-author">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=PriyaSharma&backgroundColor=22c55e" width="48" height="48" style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0" alt="Priya S."/>
        <div>
          <div class="author-name">Priya S.</div>
          <div class="author-location">&#127470;&#127475; Mumbai, India</div>
          <div style="font-size:0.7rem;color:var(--gold-bright);margin-top:2px;font-family:monospace">Platinum Vault Investor</div>
        </div>
      </div>
    </div>"""

if 'api.dicebear.com' not in content:
    # Find and replace the old testimonials grid content
    start = content.find('<div class="testimonials-grid">')
    end = content.find('</div>', content.find('Marcus C.')) + 6
    if start != -1 and end != -1:
        content = content[:start] + new_testimonials + content[end:]
        print('Testimonials replaced with face avatars')
    else:
        print('ERROR: Could not find testimonials grid boundaries')
else:
    print('Already updated')

path.write_text(content, encoding='utf-8')
print('Done: landing.html updated')
