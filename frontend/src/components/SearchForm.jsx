const propertyTypes = ['Casa', 'Departamento', 'Cabaña', 'PH', 'Oficina', 'Local'];

function SearchForm() {
	function handleSubmit(event) {
		event.preventDefault();
	}

	return (
		<form className="search-panel" onSubmit={handleSubmit}>
			<label>
				<span>¿Dónde quieres vivir?</span>
				<input id="searchUbicacion" name="ubicacion" type="search" placeholder="¿Dónde querés vivir?" />
			</label>
			<label>
				<span>Tipo de propiedad</span>
				<select id="searchCategoria" name="categoria_id" defaultValue="">
					<option value="">Categoría</option>
					{propertyTypes.map((propertyType) => (
						<option key={propertyType} value={propertyType}>{propertyType}</option>
					))}
				</select>
			</label>
			<label>
				<span>Precio máximo</span>
				<input id="searchPrecio" name="precio_max" type="number" min="0" placeholder="Precio máx." />
			</label>
			<button className="search-button" type="submit" aria-label="Buscar propiedades">
				Buscar <span aria-hidden="true">→</span>
			</button>
		</form>
	);
}

export default SearchForm;
