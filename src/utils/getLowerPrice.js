// Fungsi untuk mendapatkan harga terendah
export function getLowestPriceForResidential(residential, clusters, units) {
    // Filter clusters yang terkait dengan residential
    const relatedClusters = clusters.filter(cluster => 
      residential.clusterIds.includes(cluster.id)
    );
  
    // Kumpulkan semua unit dari cluster terkait
    const relatedUnits = units.filter(unit => 
      relatedClusters.some(cluster => cluster.unitIds.includes(unit.id))
    );
  
    // Temukan harga terendah
    const lowestPrice = Math.min(
      ...relatedUnits.map(unit => unit.price)
    );
  
    // Format rupiah
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(lowestPrice);
  };

  // Fungsi untuk mendapatkan harga terendah untuk cluster
  export function getLowestPriceForCluster(cluster, units) {
    // Filter units yang terkait dengan cluster
    const relatedUnits = units.filter(unit => 
      unit.clusterId === cluster.id
    );
  
    // Jika tidak ada unit, kembalikan null atau harga default
    if (relatedUnits.length === 0) {
      return 'N/A';
    }
  
    // Temukan harga terendah
    const lowestPrice = Math.min(
      ...relatedUnits.map(unit => unit.price)
    );
  
    // Format rupiah
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(lowestPrice);
  }
  
