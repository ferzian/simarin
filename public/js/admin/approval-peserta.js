let scale = 1;

      function openImageModal(imageSrc) {
        const modal = document.getElementById("imageModal");
        const image = document.getElementById("modalImage");
        image.src = imageSrc;
        modal.classList.remove("hidden");
        image.style.transform = "scale(1)";
        scale = 1;
      }

      function zoomImage(e) {
        e.preventDefault();
        const image = document.getElementById("modalImage");
        const delta = e.deltaY;
        scale = delta < 0 ? scale + 0.1 : Math.max(1, scale - 0.1);
        image.style.transform = `scale(${scale})`;
      }

      function closeImageModal(event) {
        const image = document.getElementById("modalImage");
        if (!image.contains(event.target)) {
          document.getElementById("imageModal").classList.add("hidden");
          image.src = "";
          scale = 1;
        }
      }

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          closeImageModal({ target: document.getElementById("imageModal") });
        }
      });