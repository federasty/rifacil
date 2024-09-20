import React, { useState, useEffect } from 'react';
import { ListadoVendedores } from './ListadoVendedores'

export const Profile = () => {

    return (
        <div>
            <div className="container-banner__vendedor">
                <header className='header__vendedor'>Admin</header>
            </div>
            <div className="profile-content">
                <ListadoVendedores />
            </div>
        </div>
    );
};
