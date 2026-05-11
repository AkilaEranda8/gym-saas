import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, Image,
  ScrollView, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShopProducts, useShopCategories, ProductDTO } from "../../src/hooks/useShop";

export default function ShopScreen() {
  const [search, setSearch]           = useState("");
  const [categoryId, setCategoryId]   = useState<string | undefined>(undefined);
  const [cart, setCart]               = useState<{ product: ProductDTO; qty: number }[]>([]);
  const [showCart, setShowCart]       = useState(false);

  const { categories, loading: catsLoading } = useShopCategories();
  const { products, loading, refetch } = useShopProducts({ categoryId, search: search || undefined });

  const filteredProducts = useMemo(() => products.filter((p) => !p.isOutOfStock), [products]);

  const addToCart = (product: ProductDTO) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stockQty) {
          Alert.alert("Stock limit", `Only ${product.stockQty} available.`);
          return prev;
        }
        return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((c) => c.product.id !== productId));

  const cartTotal = cart.reduce((s, c) => s + c.product.priceLkr * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const renderProduct = ({ item }: { item: ProductDTO }) => {
    const cartQty = cart.find((c) => c.product.id === item.id)?.qty ?? 0;
    return (
      <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)} activeOpacity={0.85}>
        <View style={styles.productImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Text style={styles.productImageIcon}>📦</Text>
            </View>
          )}
          {cartQty > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartQty}</Text>
            </View>
          )}
          {item.isLowStock && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>Low</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          {item.brand && <Text style={styles.productBrand}>{item.brand}</Text>}
          <Text style={styles.productPrice}>{item.priceFormatted}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (showCart) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCart(false)}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          data={cart}
          keyExtractor={(c) => c.product.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>Cart is empty</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{item.product.name}</Text>
                <Text style={styles.cartItemPrice}>
                  {item.product.priceFormatted} × {item.qty}
                </Text>
              </View>
              <Text style={styles.cartItemTotal}>
                Rs. {((item.product.priceLkr * item.qty) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Text>
              <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {cart.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.cartTotalRow}>
              <Text style={styles.cartTotalLabel}>Total</Text>
              <Text style={styles.cartTotalValue}>
                Rs. {(cartTotal / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <Text style={styles.cartNote}>
              Proceed to the reception counter to complete your purchase.
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => setShowCart(true)}>
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      {!catsLoading && categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          <TouchableOpacity
            style={[styles.categoryChip, categoryId === undefined && styles.categoryChipActive]}
            onPress={() => setCategoryId(undefined)}>
            <Text style={[styles.categoryChipText, categoryId === undefined && styles.categoryChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id}
              style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
              onPress={() => setCategoryId(cat.id === categoryId ? undefined : cat.id)}>
              {cat.icon && <Text style={{ marginRight: 4 }}>{cat.icon}</Text>}
              <Text style={[styles.categoryChipText, categoryId === cat.id && styles.categoryChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Products */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#f59e0b" size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={{ gap: 12 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#f59e0b" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          }
          renderItem={renderProduct}
        />
      )}

      {/* Cart bottom bar */}
      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => setShowCart(true)}>
          <Text style={styles.cartBarText}>View Cart · {cartCount} items</Text>
          <Text style={styles.cartBarTotal}>
            Rs. {(cartTotal / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#f8fafc" },
  backBtn: { color: "#f59e0b", fontSize: 16, fontWeight: "600" },
  cartButton: { position: "relative", padding: 8 },
  cartIcon: { fontSize: 22 },
  cartCountBadge: { position: "absolute", top: 4, right: 4, backgroundColor: "#ef4444", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center" },
  cartCountText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 10 },
  searchInput: { backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  categoriesContainer: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexDirection: "row" },
  categoryChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#1e293b", borderRadius: 20, borderWidth: 1, borderColor: "#334155" },
  categoryChipActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  categoryChipText: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  categoryChipTextActive: { color: "#0f172a" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  productsGrid: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
  productCard: { flex: 1, backgroundColor: "#1e293b", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#334155" },
  productImageContainer: { position: "relative", aspectRatio: 1 },
  productImage: { width: "100%", height: "100%" },
  productImagePlaceholder: { backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  productImageIcon: { fontSize: 36 },
  cartBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "#3b82f6", borderRadius: 12, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  cartBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  lowStockBadge: { position: "absolute", bottom: 6, left: 6, backgroundColor: "#f59e0b", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  lowStockText: { color: "#0f172a", fontSize: 10, fontWeight: "700" },
  productInfo: { padding: 10 },
  productName: { color: "#f1f5f9", fontSize: 13, fontWeight: "600", marginBottom: 2 },
  productBrand: { color: "#64748b", fontSize: 11, marginBottom: 4 },
  productPrice: { color: "#f59e0b", fontSize: 14, fontWeight: "700" },
  cartItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 12, padding: 14, gap: 12 },
  cartItemName: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  cartItemPrice: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  cartItemTotal: { color: "#f59e0b", fontSize: 14, fontWeight: "700" },
  removeBtn: { padding: 6, backgroundColor: "#0f172a", borderRadius: 8 },
  removeBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "700" },
  cartFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#1e293b" },
  cartTotalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cartTotalLabel: { color: "#94a3b8", fontSize: 16, fontWeight: "600" },
  cartTotalValue: { color: "#f59e0b", fontSize: 20, fontWeight: "700" },
  cartNote: { color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 8 },
  cartBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f59e0b", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28 },
  cartBarText: { color: "#0f172a", fontSize: 15, fontWeight: "700" },
  cartBarTotal: { color: "#0f172a", fontSize: 15, fontWeight: "700" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "#475569", fontSize: 15, fontWeight: "600" },
});
