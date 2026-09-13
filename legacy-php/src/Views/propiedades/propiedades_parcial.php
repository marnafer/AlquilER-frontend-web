<?php
$tituloPagina = "Propiedades Parcial";
include SRC_PATH . 'views/partials/header.php';
?>

<div class="contenedor">

  <h1>FETCH de Propiedades</h1>

  <label for="nombre_name">Buscador de propiedades:</label>

  <input type="text" name="nombre_name" id="nombre_id" required />

  <button type="submit">Buscar</button>

</div>

<script>
  const btn = document.querySelector("button");
    btn.addEventListener("click", () => {
      alert("Hiciste click pibe");
    });

</script>

<?php
include SRC_PATH . 'views/partials/footer.php';
?>