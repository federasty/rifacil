import React, { useEffect, useState } from 'react';
import { Global } from '../../../../helpers/Global'; // Ajusta la ruta según tu proyecto

export const Asignar = () => {
    const [vendedores, setVendedores] = useState([]);
    const [rifas, setRifas] = useState([]);
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
    const [rifasSeleccionadas, setRifasSeleccionadas] = useState([]);
    const token = localStorage.getItem('token');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVendedores, setFilteredVendedores] = useState([]);
    const [page, setPage] = useState(1);  // Estado para el control de la página
    const [totalPages, setTotalPages] = useState(1); // Número total de páginas
    const [showMore, setShowMore] = useState(false);

    const vendedoresPorPagina = 5;  // Número de vendedores por página

    useEffect(() => {
        document.body.style.backgroundImage = "url('/src/assets/img/BackgroundLong.png')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";

        return () => {
            document.body.style.backgroundImage = '';
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No se encontró el token de autenticación.');
                return;
            }

            try {
                // Obtener vendedores
                const responseVendedores = await fetch(`${Global.url}usuario/list`, {
                    headers: { Authorization: token },
                });
                const dataVendedores = await responseVendedores.json();
                if (dataVendedores.status === 'success') {
                    setVendedores(dataVendedores.users);
                    setFilteredVendedores(dataVendedores.users); // Inicializa los vendedores filtrados
                    setTotalPages(dataVendedores.pages); // Establece el número total de páginas
                } else {
                    console.error('Error al cargar los vendedores');
                }

                // Obtener rifas
                const responseRifas = await fetch(Global.url + 'rifa/listarRifas', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token,
                    },
                });
                const dataRifas = await responseRifas.json();
                if (dataRifas.status === 'success') {
                    setRifas(dataRifas.rifas);
                } else {
                    console.error('Error al cargar las rifas', dataRifas.message);
                }

            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Filtrar vendedores basados en el término de búsqueda
        if (searchTerm === '') {
            setFilteredVendedores(vendedores); // Si no hay término de búsqueda, mostrar todos los vendedores
        } else {
            const filtered = vendedores.filter(vendedor =>
                vendedor.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendedor.ci.toLowerCase().includes(searchTerm.toLowerCase()) // Puedes filtrar por otros campos si lo deseas
            );
            setFilteredVendedores(filtered);
        }
    }, [searchTerm, vendedores]);

    const toggleRifaSeleccionada = (rifa) => {
        if (rifasSeleccionadas.some(r => r._id === rifa._id)) {
            // Si ya está seleccionada, deseleccionar
            setRifasSeleccionadas(rifasSeleccionadas.filter(r => r._id !== rifa._id));
        } else {
            // Si no está seleccionada, agregar
            setRifasSeleccionadas([...rifasSeleccionadas, rifa]);
        }
    };

    const asignarRifas = async () => {
        if (!vendedorSeleccionado || rifasSeleccionadas.length === 0) {
            alert('Por favor, selecciona un vendedor y al menos un número de rifa.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('No se encontró el token de autenticación.');
            return;
        }

        try {
            const response = await fetch(`${Global.url}rifa/asignarRifaAVendedor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify({
                    ci: vendedorSeleccionado.ci,
                    numerosRifas: rifasSeleccionadas.map(r => r.NumeroRifa),
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Rifas asignadas con éxito.');
                setRifasSeleccionadas([]);
                setVendedorSeleccionado(null);
            } else {
                alert(result.message || 'Error al asignar las rifas.');
            }
        } catch (error) {
            console.error('Error al asignar las rifas:', error);
            alert('Error al asignar las rifas. Intenta más tarde.');
        }
    };

    const mostrarVendedoresPorPagina = filteredVendedores.slice(0, page * vendedoresPorPagina);

    const cargarMasVendedores = async () => {
        if (page < totalPages) {
            const nextPage = page + 1; // Incrementamos la página

            // Hacemos una solicitud para obtener más vendedores
            try {
                const responseVendedores = await fetch(`${Global.url}usuario/list/${nextPage}`, {
                    headers: { Authorization: token },
                });
                const dataVendedores = await responseVendedores.json();

                if (dataVendedores.status === 'success') {
                    // Agregar los vendedores de la siguiente página a los actuales
                    setVendedores((prevVendedores) => [
                        ...prevVendedores,
                        ...dataVendedores.users,
                    ]);
                    setFilteredVendedores((prevFiltered) => [
                        ...prevFiltered,
                        ...dataVendedores.users,
                    ]);
                    setPage(nextPage); // Actualizar la página actual
                } else {
                    console.error('Error al cargar más vendedores');
                }
            } catch (error) {
                console.error('Error al cargar más vendedores:', error);
            }
        }
    };

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };



    return (
        <div className="container-asignar">
            <div className="container-banner__vendedor">
                <header className="header__vendedor">Asignar Números</header>
            </div>
            <div className="asignar-rifas-container">
                <aside className="vendedores-list">
                    <h3>Vendedores</h3>
                    <div className="search-bar search-bar_asign">
                        <input
                            type="text"
                            placeholder="Buscar Vendedores"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className='search-bar__submit-button'>
                            <i className="fa-solid fa-magnifying-glass" />
                        </button>
                    </div>
                    <ul>
                        {mostrarVendedoresPorPagina.map((vendedor) => (
                            <li
                                key={vendedor._id}
                                className={`vendedor-item ${vendedorSeleccionado?._id === vendedor._id ? 'seleccionado' : ''}`}
                                onClick={() => setVendedorSeleccionado(vendedor)}
                            >
                                <h2>{vendedor.nombreCompleto}</h2>
                                <h4>Nº {vendedor.ci}</h4>
                            </li>
                        ))}
                    </ul>

                    <div className="ver-mas">
                        {showMore ? (
                            <button onClick={toggleShowMore}>Mostrar menos</button>
                        ) : (
                            page < totalPages && (
                                <button onClick={cargarMasVendedores}>Ver más vendedores</button>
                            )
                        )}
                    </div>
                </aside>

                <div className="rifas-list">
                    <h3>Números de Rifa</h3>
                    <ul className="rifa-list">
                        {rifas.map((rifa) => (
                            <li
                                key={rifa._id}
                                className={`rifa-item ${rifasSeleccionadas.some(r => r._id === rifa._id) ? 'seleccionado' : ''
                                    }`}
                                onClick={() => toggleRifaSeleccionada(rifa)}
                            >
                                {rifa.NumeroRifa}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="asignar-button">
                    <button onClick={asignarRifas} disabled={!vendedorSeleccionado || rifasSeleccionadas.length === 0}>
                        Asignar Rifas
                    </button>
                </div>
            </div>
        </div>
    );
};
