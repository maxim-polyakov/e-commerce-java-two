package com.ecommercebackend.api.controller.user;

import com.ecommercebackend.api.model.DataChange;
import com.ecommercebackend.model.Address;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.dao.AddressDAO;
import com.ecommercebackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Rest Controller for user data interactions.
 */
@RestController
@RequestMapping("/user")
@Tag(name = "Адреса пользователей", description = "API для управления адресами доставки пользователей")
public class UserController {

    /** The Address DAO. */
    @Autowired
    private AddressDAO addressDAO;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}/address")
    @Operation(
        summary = "Получить список адресов пользователя",
        description = "Возвращает все адреса доставки для указанного пользователя. Для выполнения запроса пользователь должен иметь право доступа к просматриваемому аккаунту."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Список адресов успешно получен",
            content = @Content(
                mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = Address.class))
            )
        ),
        @ApiResponse(responseCode = "403", description = "Нет прав для доступа к данным этого пользователя"),
        @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    public ResponseEntity<List<Address>> getAddress(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user,
        @Parameter(description = "Идентификатор пользователя", example = "123", required = true)
        @PathVariable Long userId) {
        if (!userService.userHasPermissionToUser(user, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(addressDAO.findByUser_Id(userId));
    }

    @PutMapping("/{userId}/address")
    @Operation(
        summary = "Создать новый адрес для пользователя",
        description = "Создаёт и сохраняет новый адрес доставки для указанного пользователя. Для выполнения запроса пользователь должен иметь право доступа к редактируемому аккаунту."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Адрес успешно создан",
            content = @Content(schema = @Schema(implementation = Address.class))
        ),
        @ApiResponse(responseCode = "400", description = "Некорректные данные адреса"),
        @ApiResponse(responseCode = "403", description = "Нет прав для изменения данных этого пользователя")
    })
    public ResponseEntity<Address> putAddress(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user,
        @Parameter(description = "Идентификатор пользователя", example = "123", required = true)
        @PathVariable Long userId,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Данные нового адреса (поле id будет проигнорировано)",
            required = true,
            content = @Content(schema = @Schema(implementation = Address.class))
        )
        @RequestBody Address address) {
        if (!userService.userHasPermissionToUser(user, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        address.setId(null);
        LocalUser refUser = new LocalUser();
        refUser.setId(userId);
        address.setUser(refUser);
        Address savedAddress = addressDAO.save(address);
        simpMessagingTemplate.convertAndSend("/topic/user/" + userId + "/address",
            new DataChange<>(DataChange.ChangeType.INSERT, address));
        return ResponseEntity.ok(savedAddress);
    }

    @PatchMapping("/{userId}/address/{addressId}")
    @Operation(
        summary = "Частично обновить адрес пользователя",
        description = "Обновляет существующий адрес доставки для указанного пользователя. Для выполнения запроса пользователь должен иметь право доступа к редактируемому аккаунту. Адрес должен принадлежать этому пользователю."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Адрес успешно обновлён",
            content = @Content(schema = @Schema(implementation = Address.class))
        ),
        @ApiResponse(responseCode = "400", description = "Некорректные данные адреса или несоответствие ID"),
        @ApiResponse(responseCode = "403", description = "Нет прав для изменения данных этого пользователя"),
        @ApiResponse(responseCode = "404", description = "Адрес или пользователь не найден")
    })
    public ResponseEntity<Address> patchAddress(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user,
        @Parameter(description = "Идентификатор пользователя", example = "123", required = true)
        @PathVariable Long userId,
        @Parameter(description = "Идентификатор обновляемого адреса", example = "456", required = true)
        @PathVariable Long addressId,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Обновляемые поля адреса (обязательно должен содержать правильный addressId)",
            required = true,
            content = @Content(schema = @Schema(implementation = Address.class))
        )
        @RequestBody Address address) {
        if (!userService.userHasPermissionToUser(user, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (address.getId() == addressId) {
            Optional<Address> opOriginalAddress = addressDAO.findById(addressId);
            if (opOriginalAddress.isPresent()) {
                LocalUser originalUser = opOriginalAddress.get().getUser();
                if (originalUser.getId() == userId) {
                    address.setUser(originalUser);
                    Address savedAddress = addressDAO.save(address);
                    simpMessagingTemplate.convertAndSend("/topic/user/" + userId + "/address",
                        new DataChange<>(DataChange.ChangeType.UPDATE, address));
                    return ResponseEntity.ok(savedAddress);
                }
            }
        }
        return ResponseEntity.badRequest().build();
    }
}