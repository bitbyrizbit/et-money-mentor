def compute_expense_drag(funds: list[dict], years: int = 20) -> dict:
    total_invested = sum(f["value"] for f in funds)
    if not total_invested:
        return {
            "weighted_expense_ratio": 0,
            "total_invested": 0,
            "gross_corpus_20yr": 0,
            "net_corpus_20yr": 0,
            "expense_drag_20yr": 0,
            "switching_to_direct_gain": 0,
            "annual_drag": 0
        }

    weighted_expense = sum(f["value"] * f.get("expense_ratio", 1.0) for f in funds) / total_invested
    assumed_return = 0.12
    net_return = assumed_return - (weighted_expense / 100)

    gross_corpus = total_invested * ((1 + assumed_return) ** years)
    net_corpus = total_invested * ((1 + net_return) ** years)
    drag_amount = gross_corpus - net_corpus

    direct_expense = 0.3
    direct_net_return = assumed_return - (direct_expense / 100)
    direct_corpus = total_invested * ((1 + direct_net_return) ** years)
    switching_gain = direct_corpus - net_corpus

    return {
        "weighted_expense_ratio": round(weighted_expense, 3),
        "total_invested": round(total_invested, 2),
        "gross_corpus_20yr": round(gross_corpus, 2),
        "net_corpus_20yr": round(net_corpus, 2),
        "expense_drag_20yr": round(drag_amount, 2),
        "switching_to_direct_gain": round(switching_gain, 2),
        "annual_drag": round(total_invested * weighted_expense / 100, 2)
    }
