let menu = document.querySelector('#menu-icon');
            let navlist = document.querySelector('.navlist');

            menu.onclick = () => {
                menu.classList.toggle('bx-x');
                navlist.classList.toggle('open');
            }
















const dropdown = document.querySelector('.mobile-dropdown > a');
            const dropdownLi = document.querySelector('.mobile-dropdown');

            dropdown.addEventListener('click', function(e){
                e.preventDefault(); // prepreči redirect
                dropdownLi.classList.toggle('open');
            });

            var navbar = document.querySelector(".nav_bar");
            var stickyOffset = navbar.offsetTop;

            function stickyNavbar() {
                if (window.pageYOffset > stickyOffset) {
                    navbar.classList.add("sticky");
                } else {
                    navbar.classList.remove("sticky");
                }
            }

            window.addEventListener("scroll", stickyNavbar);

            document.querySelectorAll('.preberi-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const vec = btn.previousElementSibling; // najde .vec div

                    vec.classList.toggle('open');

                    // zamenjaj tekst gumba
                    if (vec.classList.contains('open')) {
                        btn.textContent = 'Skrij';
                    } else {
                        btn.textContent = 'Preberi več';
                    }
                });
            });

            function relativniCas(datumString) {
                const takrat = new Date(datumString);
                const zdaj = new Date();
                const dni = Math.floor((zdaj - takrat) / (1000 * 60 * 60 * 24));

                if (dni < 1) return 'danes';
                if (dni === 1) return 'pred 1 dnem';
                if (dni < 7) return `pred ${dni} dnevi`;

                const tedni = Math.floor(dni / 7);
                if (tedni === 1) return 'pred 1 tednom';
                if (tedni < 4) return `pred ${tedni} tedni`;

                const meseci = Math.floor(dni / 30.44);
                if (meseci === 1) return 'pred 1 mesecem';
                if (meseci < 12) return `pred ${meseci} meseci`;

                const leta = Math.floor(dni / 365.25);
                if (leta === 1) return 'pred 1 letom';
                return `pred ${leta} leti`;
            }

            document.querySelectorAll('.google-review-datum[data-datum]').forEach(el => {
                el.textContent = relativniCas(el.getAttribute('data-datum'));
            });


            // SANITY CMS - skupne pomožne funkcije
            const SANITY_PROJECT_ID = 'xk13df75';
            const SANITY_DATASET = 'production';

            async function sanityFetch(groqQuery) {
                const url = 'https://' + SANITY_PROJECT_ID + '.api.sanity.io/v2024-01-01/data/query/' + SANITY_DATASET + '?query=' + encodeURIComponent(groqQuery);
                const res = await fetch(url);
                if (!res.ok) throw new Error('Sanity fetch failed: ' + res.status);
                const json = await res.json();
                return json.result;
            }

            function besediloVParagrafe(blocks) {
                if (!Array.isArray(blocks)) return [];
                return blocks
                    .filter(b => b && b._type === 'block' && Array.isArray(b.children))
                    .map(b => b.children.map(c => c.text || '').join(''));
            }

            function razdeliVSredini(text) {
                if (!text) return text;
                const mid = Math.floor(text.length / 2);
                let bestIdx = -1, bestDist = Infinity;
                for (let i = 0; i < text.length; i++) {
                    if (text[i] === ' ') {
                        const dist = Math.abs(i - mid);
                        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
                    }
                }
                if (bestIdx === -1) return text;
                return text.slice(0, bestIdx) + '<br>' + text.slice(bestIdx + 1);
            }

            async function nalozibesedila(kljuci) {
                const seznam = kljuci.map(k => '"' + k + '"').join(',');
                const query = '*[_type=="stran" && kljuc in [' + seznam + ']]{kljuc, vsebina}';
                const rows = await sanityFetch(query);
                const map = {};
                (rows || []).forEach(r => { map[r.kljuc] = besediloVParagrafe(r.vsebina); });
                return map;
            }

            // DOMOV - hero naslov/podnaslov in "Na kratko o nas"
            const domovHeroNaslov = document.getElementById('domov-hero-naslov');
            if (domovHeroNaslov) {
                nalozibesedila(['domov-hero-naslov', 'domov-hero-podnaslov', 'domov-o-nas']).then(map => {
                    if (map['domov-hero-naslov'] && map['domov-hero-naslov'][0]) {
                        domovHeroNaslov.innerHTML = razdeliVSredini(map['domov-hero-naslov'][0]);
                    }
                    const podnaslov = document.getElementById('domov-hero-podnaslov');
                    if (podnaslov && map['domov-hero-podnaslov'] && map['domov-hero-podnaslov'][0]) {
                        podnaslov.textContent = map['domov-hero-podnaslov'][0];
                    }
                    const oNasDiv = document.getElementById('domov-o-nas');
                    if (oNasDiv && map['domov-o-nas'] && map['domov-o-nas'].length) {
                        oNasDiv.innerHTML = map['domov-o-nas'].map(p => '<p>' + p + '</p>').join('');
                    }
                }).catch(err => console.error('Napaka pri nalaganju besedil (domov):', err));
            }

            // O NAS - uvodno besedilo in zaposleni
            const oNasUvod = document.getElementById('o-nas-uvod');
            if (oNasUvod) {
                nalozibesedila(['o-nas-uvod']).then(map => {
                    if (map['o-nas-uvod'] && map['o-nas-uvod'].length) {
                        oNasUvod.innerHTML = map['o-nas-uvod'].map(p => '<p>' + p + '</p>').join('');
                    }
                }).catch(err => console.error('Napaka pri nalaganju besedila (o-nas-uvod):', err));
            }

            const zaposleniSeznam = document.getElementById('zaposleni-seznam');
            if (zaposleniSeznam) {
                sanityFetch('*[_type=="zaposleni"] | order(vrstniRed asc) {ime, vloga, opis, "slikaUrl": slika.asset->url}')
                    .then(zaposleni => {
                        if (!zaposleni || !zaposleni.length) return;
                        zaposleniSeznam.innerHTML = zaposleni.map(z =>
                            '<div class="kartica">' +
                                '<div class="kartica-slika" style="background-image: url(\'' + z.slikaUrl + '\')"></div>' +
                                '<div class="kartica-label">' +
                                    '<h2>' + z.ime + '</h2>' +
                                    (z.vloga ? '<span>' + z.vloga + '</span>' : '') +
                                '</div>' +
                                '<div class="kartica-info">' +
                                    '<p>' + (z.opis || '') + '</p>' +
                                '</div>' +
                            '</div>'
                        ).join('');
                    }).catch(err => console.error('Napaka pri nalaganju zaposlenih:', err));
            }

            // O NAS - takoj odpri opis zaposlenega ob kliku/dotiku (namesto dolgega pritiska za hover)
            // uporabimo delegacijo, ker se .kartica elementi ustvarijo šele po nalaganju iz CMS-ja
            document.addEventListener('click', (e) => {
                const k = e.target.closest('.kartica');
                if (!k) return;
                const bilaOdprta = k.classList.contains('odprta');
                document.querySelectorAll('.kartica.odprta').forEach(o => o.classList.remove('odprta'));
                if (!bilaOdprta) k.classList.add('odprta');
            });

            // KONTAKT - uvodno besedilo
            const kontaktUvod = document.getElementById('kontakt-uvod');
            if (kontaktUvod) {
                nalozibesedila(['kontakt-uvod']).then(map => {
                    if (map['kontakt-uvod'] && map['kontakt-uvod'].length) {
                        kontaktUvod.innerHTML = map['kontakt-uvod'].map(p => '<p>' + p + '</p>').join('');
                    }
                }).catch(err => console.error('Napaka pri nalaganju besedila (kontakt-uvod):', err));
            }


            // PIŠKOTKI - obvestilo o soglasju
            (function(){
                var SOGLASJE_KEY = 'ma_cookie_soglasje';
                if (localStorage.getItem(SOGLASJE_KEY)) return;

                var style = document.createElement('style');
                style.textContent = `
                    .cookie-banner{
                        position: fixed;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 20000;
                        background: #14213D;
                        color: #ffffff;
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 20px clamp(20px, 5vw, 70px);
                        box-shadow: 0 -10px 30px rgba(10,22,45,0.35);
                        transform: translateY(120%);
                        transition: transform .5s ease;
                    }
                    .cookie-banner.show{
                        transform: translateY(0);
                    }
                    .cookie-banner p{
                        margin: 0;
                        max-width: 780px;
                        font-size: clamp(12px, .85vw, 20px);
                        font-weight: 300;
                        line-height: 1.5;
                        font-family: 'Times New Roman', Times, serif;
                    }
                    .cookie-banner a{
                        color: #FFE599;
                        text-decoration: underline;
                    }
                    .cookie-banner a:hover{
                        color: #ffffff;
                    }
                    .cookie-banner-gumbi{
                        display: flex;
                        gap: 14px;
                        flex-shrink: 0;
                    }
                    .cookie-banner button{
                        position: relative;
                        border-radius: 999px;
                        padding: 10px 26px;
                        font-size: clamp(12px, .85vw, 18px);
                        font-weight: 600;
                        font-family: 'Times New Roman', Times, serif;
                        cursor: pointer;
                        box-shadow: rgba(0,0,0,0.41) 0px 10px 20px, rgba(0,0,0,0.23) 0px 6px 6px;
                        transition: transform 0.25s ease, box-shadow 0.25s ease;
                        border: none;
                    }
                    .cookie-banner button:hover{
                        transform: translateY(-6px);
                        box-shadow: rgba(0,0,0,0.45) 0px 14px 24px, rgba(0,0,0,0.25) 0px 8px 8px;
                    }
                    #cookie-sprejmi{
                        background-color: #C9A227;
                        color: #14213D;
                    }
                    #cookie-zavrni{
                        background-color: transparent;
                        color: #ffffff;
                        border: solid 1px #ffffff;
                    }
                    @media(max-width:700px){
                        .cookie-banner{
                            flex-direction: column;
                            align-items: flex-start;
                        }
                        .cookie-banner-gumbi{
                            width: 100%;
                        }
                        .cookie-banner button{
                            flex: 1;
                        }
                    }
                `;
                document.head.appendChild(style);

                var banner = document.createElement('div');
                banner.id = 'cookie-banner';
                banner.className = 'cookie-banner';
                banner.innerHTML =
                    '<p>Ta spletna stran uporablja piškotke tretjih oseb (npr. Google zemljevid in Google pisave), ki so potrebni za pravilno delovanje in prikaz vsebin. Več informacij najdete v naši <a href="politika-zasebnosti.html">politiki zasebnosti</a>.</p>' +
                    '<div class="cookie-banner-gumbi">' +
                        '<button id="cookie-zavrni" type="button">Zavrni</button>' +
                        '<button id="cookie-sprejmi" type="button">Sprejmi</button>' +
                    '</div>';
                document.body.appendChild(banner);

                requestAnimationFrame(function(){
                    requestAnimationFrame(function(){ banner.classList.add('show'); });
                });

                function zapriBanner(vrednost) {
                    localStorage.setItem(SOGLASJE_KEY, vrednost);
                    banner.classList.remove('show');
                    setTimeout(function(){ banner.remove(); }, 500);
                }

                document.getElementById('cookie-sprejmi').addEventListener('click', function(){ zapriBanner('sprejeto'); });
                document.getElementById('cookie-zavrni').addEventListener('click', function(){ zapriBanner('zavrnjeno'); });
            })();
