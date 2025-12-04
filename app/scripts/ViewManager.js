export class ViewManager {
  show(id) {
    document
      .querySelectorAll('.view')
      .forEach((v) => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document
      .querySelectorAll('nav-btn')
      .forEach((n) => n.classList.remove('active'));
  }
}
