import { useState, useContext } from "react";
import { Context } from "../index";
import { addUserAddress } from "../http/userApi";

const AddressForm = () => {
    const { user } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [address, setAddress] = useState({
        street: "",
        city: "",
        postalCode: "",
        country: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user.isAuth) {
            setError("Необходимо авторизоваться");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // Используем ID пользователя из контекста
            await addUserAddress(user.user.id, address);

            setSuccess("Адрес успешно добавлен");
            setAddress({ street: "", city: "", postalCode: "", country: "" });

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="mb-3">
                <label>Улица</label>
                <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="mb-3">
                <label>Город</label>
                <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="mb-3">
                <label>Почтовый индекс</label>
                <input
                    type="text"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="mb-3">
                <label>Страна</label>
                <input
                    type="text"
                    name="country"
                    value={address.country}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
            >
                {loading ? "Добавление..." : "Добавить адрес"}
            </button>
        </form>
    );
};

export default AddressForm;