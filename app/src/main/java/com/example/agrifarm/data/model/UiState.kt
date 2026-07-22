package com.satish.agrifarm.data.model

/**
 * Sealed class for representing UI state in all ViewModels.
 * Replaces bare List<T> flows with explicit Loading/Success/Error states.
 *
 * Usage:
 *   val products: StateFlow<UiState<List<Product>>> = _products.asStateFlow()
 *
 *   // In composable:
 *   when (val state = products.collectAsState().value) {
 *       is UiState.Loading -> SkeletonList()
 *       is UiState.Success -> ProductList(state.data)
 *       is UiState.Error   -> ErrorScreen(state.message)
 *   }
 */
sealed class UiState<out T> {
    /** Initial loading / refreshing state */
    object Loading : UiState<Nothing>()

    /** Data loaded successfully */
    data class Success<T>(val data: T) : UiState<T>()

    /** An error occurred */
    data class Error(val message: String, val code: Int = 0) : UiState<Nothing>()

    /** Convenience helpers */
    val isLoading get() = this is Loading
    val isSuccess get() = this is Success
    val isError   get() = this is Error

    fun dataOrNull(): T? = if (this is Success) data else null
}
