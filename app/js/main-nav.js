var openMenu = document.getElementsByClassName('main-nav__open-btn')[0];

function showMobileMenu(event) {
    event.preventDefault();
    var mobileMenu = document.getElementsByClassName('main-nav__dropdown-list')[0];
    openMenu.classList.toggle('main-nav__close-btn');
    mobileMenu.classList.toggle('main-nav__dropdown-list--show');
}
openMenu.addEventListener('click', showMobileMenu);
