// src/utils/propertyHelpers.js
export const formatPrice = (price) => {
  return price ? `Rp${price.toLocaleString()}` : "N/A";
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export const filterProperties = (properties, searchTerm, filterStatus) => {
  return properties.filter((property) => {
    const matchesSearch =
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.location?.city || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && property.propertyStatus === filterStatus;
  });
};

export const sortProperties = (properties, sortBy, sortOrder) => {
  return [...properties].sort((a, b) => {
    let valueA, valueB;

    if (sortBy === "name") {
      valueA = a.name?.toLowerCase() || "";
      valueB = b.name?.toLowerCase() || "";
    } else if (sortBy === "price") {
      valueA = a.startPrice || 0;
      valueB = b.startPrice || 0;
    } else if (sortBy === "location") {
      valueA = (a.location?.city || "").toLowerCase();
      valueB = (b.location?.city || "").toLowerCase();
    } else {
      valueA = a[sortBy] || "";
      valueB = b[sortBy] || "";
    }

    return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });
};