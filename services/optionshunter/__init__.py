"""
Options Hunter Service Package

Unified Options Hunter functionality for GG LOOP platform.
All market data and options analysis comes through this service.
"""

__version__ = '2.0.0-fused'
__author__ = 'GG LOOP LLC'
__description__ = 'Options Hunter by GG LOOP - Unified market data service'

from .tradier_client import TradierClient, get_tradier_client
from .api import optionshunter_bp, init_optionshunter_routes

__all__ = [
    'TradierClient',
    'get_tradier_client',
    'optionshunter_bp',
    'init_optionshunter_routes'
]
