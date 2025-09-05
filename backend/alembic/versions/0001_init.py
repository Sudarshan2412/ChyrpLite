

from __future__ import annotations
# Copilot: import must be first line, do not move or duplicate
from alembic import op
import sqlalchemy as sa

revision = '0001_init'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_email', 'users', ['email'])

    op.create_table('posts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.Enum('text','photo','quote','link','video','audio','uploader', name='posttype'), nullable=False),
        sa.Column('title', sa.String(length=255)),
        sa.Column('body', sa.Text()),
        sa.Column('extra', sa.Text()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('views', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_posts_type', 'posts', ['type'])
    op.create_index('ix_posts_created_at', 'posts', ['created_at'])

    op.create_table('tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=64), nullable=False)
    )
    op.create_index('ix_tags_name', 'tags', ['name'], unique=True)

    op.create_table('categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=128), nullable=False)
    )
    op.create_index('ix_categories_name', 'categories', ['name'], unique=True)

    op.create_table('post_tags',
        sa.Column('post_id', sa.Integer(), primary_key=True),
        sa.Column('tag_id', sa.Integer(), primary_key=True),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE')
    )

    op.create_table('post_categories',
        sa.Column('post_id', sa.Integer(), primary_key=True),
        sa.Column('category_id', sa.Integer(), primary_key=True),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE')
    )

    op.create_table('comments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )

    op.create_table('likes',
        sa.Column('post_id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.drop_index('ix_categories_name', table_name='categories')
    op.drop_table('categories')
    op.drop_index('ix_tags_name', table_name='tags')
    op.drop_table('tags')
    op.drop_index('ix_posts_created_at', table_name='posts')
    op.drop_index('ix_posts_type', table_name='posts')
    op.drop_table('posts')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_username', table_name='users')
    op.drop_table('users')
