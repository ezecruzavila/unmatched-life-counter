package com.unmatchedcounter.ui.setup

import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.core.content.ContextCompat
import com.unmatchedcounter.R

/**
 * Fila cerrada: transparente (el borde de color va en `setup_spinner_row_*`).
 * Dropdown: mismo estilo neutro que el campo (gris), sin color por personaje.
 */
internal class CharacterSpinnerAdapter(
    context: Context,
    private val names: List<String>,
) : ArrayAdapter<String>(
    context,
    R.layout.item_setup_spinner_text,
    android.R.id.text1,
    names,
) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val row = super.getView(position, convertView, parent)
        row.setBackgroundColor(Color.TRANSPARENT)
        return row
    }

    override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
        val row = super.getDropDownView(position, convertView, parent)
        row.background = ContextCompat.getDrawable(context, R.drawable.setup_spinner_field_bg)
        return row
    }
}
