package pe.edu.upeu.Practica.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.Practica.dto.ClienteRequestDTO;
import pe.edu.upeu.Practica.dto.ClienteResponseDTO;
import pe.edu.upeu.Practica.entity.Cliente;
import pe.edu.upeu.Practica.exception.RecursosNoEncontradoException;
import pe.edu.upeu.Practica.exception.ReglaNegocioException;
import pe.edu.upeu.Practica.repository.ClienteRepository;
import pe.edu.upeu.Practica.service.service.ClienteService;

@Service
public class ClienteServiceImpl implements ClienteService {
    private static final Logger log =
            LoggerFactory.getLogger(ClienteServiceImpl.class);

    private final ClienteRepository clienteRepository;

    public ClienteServiceImpl(
            ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    @Transactional
    public ClienteResponseDTO create(ClienteRequestDTO t) {
        log.info(
                "Registrando cliente con DNI={}",
                t.getDni()
        );

        String dni = t.getDni().trim();
        String email = t.getEmail()
                .trim()
                .toLowerCase();

        // Regla de negocio 1
        if (clienteRepository.existsByDni(dni)) {
            throw new ReglaNegocioException(
                    "Ya existe un cliente con el DNI: " + dni
            );
        }

        // Regla de negocio 2
        if (clienteRepository.existsByEmailIgnoreCase(email)) {
            throw new ReglaNegocioException(
                    "Ya existe un cliente con el correo: " + email
            );
        }

        Cliente cliente = new Cliente();

        cliente.setDni(dni);
        cliente.setNombres(
                t.getNombres().trim()
        );
        cliente.setApellidos(
                t.getApellidos().trim()
        );
        cliente.setEmail(email);
        cliente.setTelefono(
                normalizar(t.getTelefono())
        );
        cliente.setDireccion(
                normalizar(t.getDireccion())
        );
        cliente.setEstado(t.getEstado());

        Cliente guardado =
                clienteRepository.save(cliente);

        log.info(
                "Cliente registrado correctamente id={}",
                guardado.getId()
        );
        return convertirResponse(guardado);
    }

    @Override
    @Transactional
    public ClienteResponseDTO update(Long aLong, ClienteRequestDTO t) {
        Cliente cliente =
                clienteRepository.findById(aLong)
                        .orElseThrow(() ->
                                new RecursosNoEncontradoException(
                                        "Cliente no encontrado con id: " + aLong
                                )
                        );

        String dni = t.getDni().trim();
        String email = t.getEmail()
                .trim()
                .toLowerCase();

        // DNI de otro cliente
        if (clienteRepository
                .existsByDniAndIdNot(dni, aLong)) {

            throw new ReglaNegocioException(
                    "Ya existe otro cliente con el DNI: "
                            + dni
            );
        }

        // Email de otro cliente
        if (clienteRepository
                .existsByEmailIgnoreCaseAndIdNot(
                        email,
                        aLong)) {

            throw new ReglaNegocioException(
                    "Ya existe otro cliente con el correo: "
                            + email
            );
        }

        cliente.setDni(dni);
        cliente.setNombres(
                t.getNombres().trim()
        );
        cliente.setApellidos(
                t.getApellidos().trim()
        );
        cliente.setEmail(email);
        cliente.setTelefono(
                normalizar(t.getTelefono())
        );
        cliente.setDireccion(
                normalizar(t.getDireccion())
        );
        cliente.setEstado(t.getEstado());

        Cliente actualizado =
                clienteRepository.save(cliente);

        log.info(
                "Cliente id={} actualizado correctamente",
                aLong
        );

        return convertirResponse(actualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO read(Long aLong) {
        log.info("Buscando cliente id={}", aLong);

        Cliente cliente =
                clienteRepository.findById(aLong)
                        .orElseThrow(() ->
                                new RecursosNoEncontradoException(
                                        "Cliente no encontrado con id: " + aLong
                                )
                        );

        return convertirResponse(cliente);
    }

    @Override
    @Transactional
    public void delete(Long aLong) {
        Cliente cliente =
                clienteRepository.findById(aLong)
                        .orElseThrow(() ->
                                new RecursosNoEncontradoException(
                                        "Cliente no encontrado con id: " + aLong
                                )
                        );

        if (!Boolean.TRUE.equals(cliente.getEstado())) { throw new ReglaNegocioException("El cliente ya está inactivo."); }
        cliente.setEstado(false);
        clienteRepository.save(cliente);

        log.info(
                "Cliente id={} eliminado correctamente",
                aLong
        );
    }

    private ClienteResponseDTO convertirResponse(
            Cliente cliente) {

        return new ClienteResponseDTO(
                cliente.getId(),
                cliente.getDni(),
                cliente.getNombres(),
                cliente.getApellidos(),
                cliente.getEmail(),
                cliente.getTelefono(),
                cliente.getDireccion(),
                cliente.getEstado(),
                cliente.getFechaCreacion(),
                cliente.getFechaModificacion()
        );
    }

    private String normalizar(String valor) {

        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<ClienteResponseDTO> readAll() {
        log.info("Listando clientes");

        return clienteRepository.findAll()
                .stream()
                .map(this::convertirResponse)
                .toList();
    }
    @Override
    @Transactional(readOnly = true)
    public pe.edu.upeu.Practica.dto.PaginaResponseDTO<ClienteResponseDTO> listar(int pagina, int tamanio, String ordenarPor, String direccion) {
        if (pagina < 0 || tamanio < 1 || tamanio > 100) throw new ReglaNegocioException("Parámetros de paginación inválidos.");
        if (!java.util.Set.of("id", "dni", "nombres", "apellidos", "email").contains(ordenarPor)) throw new ReglaNegocioException("Campo de orden no permitido.");
        if (!java.util.Set.of("asc", "desc").contains(direccion)) throw new ReglaNegocioException("Dirección de orden no permitida.");
        var sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.fromString(direccion), ordenarPor);
        if (!ordenarPor.equals("id")) sort = sort.and(org.springframework.data.domain.Sort.by("id"));
        var resultado = clienteRepository.findAll(org.springframework.data.domain.PageRequest.of(pagina, tamanio, sort));
        return new pe.edu.upeu.Practica.dto.PaginaResponseDTO<>(resultado.getContent().stream().map(this::convertirResponse).toList(), resultado.getNumber(), resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages(), resultado.isLast());
    }
}
