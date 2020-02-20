const loader = document.getElementById("loader");

loader.loaderVisible = () => {
    loader.classList.remove("hidden");
    loader.classList.add("visible");
  };
  loader.loaderHide  = () => {
    loader.classList.remove("visible");
    loader.classList.add("hidden");
  };

export default loader;