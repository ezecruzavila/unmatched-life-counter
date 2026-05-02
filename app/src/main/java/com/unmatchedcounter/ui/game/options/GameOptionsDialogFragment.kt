package com.unmatchedcounter.ui.game.options

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.activityViewModels
import com.unmatchedcounter.R
import com.unmatchedcounter.ui.game.GameViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class GameOptionsDialogFragment : DialogFragment() {
    companion object {
        fun newInstance(): GameOptionsDialogFragment {
            val f = GameOptionsDialogFragment()
            f.arguments = Bundle()
            return f
        }
    }

    private val viewModel: GameViewModel by activityViewModels()

    private lateinit var closeButton: View
    private lateinit var hideNavigationCheckbox: CheckBox

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return LayoutInflater.from(context).inflate(R.layout.fragment_game_options, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        closeButton = view.findViewById(R.id.close_button)
        closeButton.setOnClickListener {
            dismiss()
        }

        hideNavigationCheckbox = view.findViewById(R.id.hide_navigation_checkbox)

        viewModel.hideNavigation.observe(viewLifecycleOwner) {
            it?.let { value ->
                hideNavigationCheckbox.setOnCheckedChangeListener(null)
                if (hideNavigationCheckbox.isChecked != value) {
                    hideNavigationCheckbox.isChecked = value
                }
                hideNavigationCheckbox.setOnCheckedChangeListener { _, isChecked ->
                    viewModel.setHideNavigation(isChecked)
                }
            }
        }
    }
}
