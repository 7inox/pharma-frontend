package pe.edu.upeu.Practica.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.Practica.dto.CategoriaRequestDTO;
import pe.edu.upeu.Practica.dto.CategoriaResponseDTO;
import pe.edu.upeu.Practica.entity.Categoria;
import pe.edu.upeu.Practica.exception.RecursosNoEncontradoException;
import pe.edu.upeu.Practica.exception.ReglaNegocioException;
import pe.edu.upeu.Practica.repository.CategoriaRepository;
import pe.edu.upeu.Practica.service.service.CategoriaService;


@Service
public class CategoriaServiceImpl implements CategoriaService {
    private static final Logger LOG = LoggerFactory.getLogger(CategoriaServiceImpl.class);
    private final CategoriaRepository categoriaRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional
    public CategoriaResponseDTO create(CategoriaRequestDTO t) {
        String nombre = t.getNombre().trim();
        if(categoriaRepository.existsByNombreIgnoreCase(nombre)){
            throw new ReglaNegocioException(
                    "Ya existe una categoria con el nombre: " + nombre
            );
        }

        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        categoria.setDescripcion(t.getDescripcion());
        categoria.setEstado(t.getEstado());

        Categoria catCreada = categoriaRepository.save(categoria);
        return convertirResponse(catCreada);
    }

    @Override
    public CategoriaResponseDTO update(Long aLong, CategoriaRequestDTO t) {
        Categoria categoria = categoriaRepository.findById(aLong).orElseThrow(()->
        new RecursosNoEncontradoException(
                "Categoria no encontrada con id: " + aLong)
        );
        categoria.setNombre(t.getNombre());
        categoria.setDescripcion(t.getDescripcion());
        categoria.setEstado(t.getEstado());

        Categoria catActualizada = categoriaRepository.save(categoria);
        return convertirResponse(catActualizada);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriaResponseDTO read(Long aLong) {
        Categoria categoria = categoriaRepository.findById(aLong).orElseThrow(() ->
                new RecursosNoEncontradoException(
                        "Categoria no encontrada con id: " + aLong)
        );
        return convertirResponse(categoria);
    }

    @Override
    @Transactional
    public void delete(Long aLong) {
        Categoria categoria = categoriaRepository.findById(aLong).orElseThrow(() ->
                new RecursosNoEncontradoException(
                        "Categoria no encontrada con id: " + aLong)
        );
    categoriaRepository.delete(categoria);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<CategoriaResponseDTO> readAll() {
        return categoriaRepository.findAll().stream().map(this::convertirResponse).toList();
    }

    private CategoriaResponseDTO convertirResponse(Categoria categoria) {
        return new CategoriaResponseDTO(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getDescripcion(),
                categoria.getEstado(),
                categoria.getFechaCreacion(),
                categoria.getFechaModificacion()
        );
    }
}
