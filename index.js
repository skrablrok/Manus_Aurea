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
