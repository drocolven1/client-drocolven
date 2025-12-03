export  function filtrarPorMultiplesPalabrasAND<T>(
    data: T[],
    textoBusqueda: string,
    campos: (keyof T)[]
  ): T[] {
    const palabras = textoBusqueda.toLowerCase().split(" ").filter(Boolean);

    return data.filter((item) =>
      palabras.every((palabra) =>
        campos.some((campo) =>
          String(item[campo]).toLowerCase().includes(palabra)
        )
      )
    );
  }