package pe.edu.upeu.Practica.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.Practica.dto.ProductoRequestDTO;
import pe.edu.upeu.Practica.dto.ProductoResponseDTO;
import pe.edu.upeu.Practica.entity.Categoria;
import pe.edu.upeu.Practica.entity.Producto;
import pe.edu.upeu.Practica.exception.RecursosNoEncontradoException;
import pe.edu.upeu.Practica.exception.ReglaNegocioException;
import pe.edu.upeu.Practica.repository.CategoriaRepository;
import pe.edu.upeu.Practica.repository.ProductoRepository;
import pe.edu.upeu.Practica.service.service.ProductoService;

import java.math.BigDecimal;

@Service
public class ProductoServiceImpl implements ProductoService {
    private static final Logger LOG = LoggerFactory.getLogger(ProductoServiceImpl.class);
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoServiceImpl(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional
    public ProductoResponseDTO create(ProductoRequestDTO t) {
        String nombre = t.getNombre().trim();
        if (productoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ReglaNegocioException(
                    "Ya existe un producto con el nombre: " + nombre
            );
        }

        Categoria categoria = categoriaRepository.findById(t.getCategoriaId()).orElseThrow(() ->
                new RecursosNoEncontradoException(
                        "Categoria no encontrada con id: " + t.getCategoriaId())
        );

        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setPrecio(BigDecimal.valueOf(t.getPrecio()));
        producto.setStock(t.getStock());
        producto.setEstado(t.getEstado());
        producto.setCategoria(categoria);

        Producto productoCreado = productoRepository.save(producto);
        return convertirResponse(productoCreado);
    }

    @Override
    @Transactional
    public ProductoResponseDTO update(Long aLong, ProductoRequestDTO t) {
        Producto producto = productoRepository.findById(aLong).orElseThrow(() ->
                new RecursosNoEncontradoException(
                        "Producto no encontrado con id: " + aLong)
        );

        String nombre = t.getNombre().trim();
        if (productoRepository.existsByNombreIgnoreCaseAndIdNot(nombre, aLong)) {
            throw new ReglaNegocioException(
                    "Ya existe un producto con el nombre: " + nombre
            );
        }

        Categoria categoria = categoriaRepository.findById(t.getCategoriaId()).orElseThrow(() ->
                new RecursosNoEncontradoException(
                        "Categoria no encontrada con id: " + t.getCategoriaId())
        );

        producto.setNombre(nombre);
        producto.setPrecio(BigDecimal.valueOf(t.getPrecio()));
        producto.setStock(t.getStock());
        producto.setEstado(t.getEstado());
        producto.setCategoria(categoria);

        Producto productoActualizado = productoRepository.save(producto);
        return convertirResponse(productoActualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponseDTO read(Long aLong) {
        Producto producto = productoRepository.findById(aLong).orElseThrow(() ->
                new RecursosNoEncontradoException(
                        "Producto no encontrado con id: " + aLong)
        );
        return convertirResponse(producto);
    }

    @Override
    @Transactional
    public void delete(Long aLong) {
        Producto producto = productoRepository.findById(aLong).orElseThrow(() ->
                new RecursosNoEncontradoException(
                        "Producto no encontrado con id: " + aLong)
        );
        productoRepository.delete(producto);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<ProductoResponseDTO> readAll() {
        return productoRepository.findAll().stream().map(this::convertirResponse).toList();
    }

    private ProductoResponseDTO convertirResponse(Producto producto) {
        return new ProductoResponseDTO(
                producto.getId(),
                producto.getNombre(),
                producto.getPrecio().doubleValue(),
                producto.getStock(),
                producto.getEstado(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.getFechaCreacion(),
                producto.getFechaModificacion()
        );
    }
}
