import { ViewManager } from './ViewManager.js';
import { TeamController } from '../controllers/TeamController.js';
import { NavController } from '../controllers/NavController.js';

const navButtons = document.querySelectorAll('.nav-btn');
const navElements = document.querySelectorAll('.nav-el');

const vm = new ViewManager();

vm.show('home-view');

navButtons.forEach((nav) =>
  nav.addEventListener('click', () => {
    const id = nav.innerHTML.toString().toLowerCase() + '-view';

    vm.show(id);

    navElements.forEach((n) => n.classList.remove('active'));
    nav.closest('li').classList.add('active');
  })
);

new TeamController(vm);
